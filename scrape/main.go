package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
)

type Anime struct {
	Title          string   `json:"title"`
	URL            string   `json:"url"`
	CoverImg       string   `json:"coverImg,omitempty"`
	Sinopsis       string   `json:"sinopsis,omitempty"`
	InfoItems      []string `json:"infoItems,omitempty"`
	OtherEpisodes  []Episode `json:"otherEpisodes,omitempty"`
	Episodes       []EpisodeData `json:"episodes,omitempty"`
}

type Episode struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type EpisodeData struct {
	Title      string   `json:"title"`
	URL        string   `json:"url"`
	IframeSrc  string   `json:"iframeSrc,omitempty"`
	Options    []string `json:"options,omitempty"`
}

func main() {
	batchIndex, _ := strconv.Atoi(os.Getenv("BATCH_INDEX"))
	batchSize, _ := strconv.Atoi(os.Getenv("BATCH_SIZE"))

	today := time.Now()
	fmt.Printf("📅 %s | Batch %d | Size %d\n", today.Format("Mon, 02 Jan 2006"), batchIndex, batchSize)

	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-setuid-sandbox", true),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()
	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	baseURL := "https://oploverz.co.id/anime-list/"
	fmt.Println("🌐 Navigating to:", baseURL)

	var animeList []Anime
	err := chromedp.Run(ctx,
		chromedp.Navigate(baseURL),
		chromedp.WaitVisible(".maxullink a"),
		chromedp.EvaluateAsDevTools(`
			[...document.querySelectorAll('.maxullink a')].map(a => ({
				title: a.textContent.trim(),
				url: a.href
			}))
		`, &animeList),
	)
	if err != nil {
		fmt.Println("❌ Error fetching anime list:", err)
		os.Exit(1)
	}
	fmt.Printf("✅ Found %d anime(s)\n", len(animeList))

	start := batchIndex * batchSize
	end := start + batchSize
	if start >= len(animeList) {
		fmt.Println("No more anime in this batch.")
		return
	}
	if end > len(animeList) {
		end = len(animeList)
	}
	batch := animeList[start:end]
	fmt.Printf("🧩 Processing batch %d (%d–%d)\n", batchIndex, start, end-1)

	var results []Anime
	for _, anime := range batch {
		fmt.Println("🎬 Scraping:", anime.Title)
		data, err := scrapeAnimeDetails(ctx, anime.URL)
		if err != nil {
			fmt.Println("⚠️ Error:", err)
			continue
		}
		anime.CoverImg = data.CoverImg
		anime.Sinopsis = data.Sinopsis
		anime.InfoItems = data.InfoItems
		anime.OtherEpisodes = data.OtherEpisodes
		anime.Episodes = data.Episodes
		results = append(results, anime)
	}

	os.MkdirAll("public", os.ModePerm)
	filePath := filepath.Join("public", "anime.json")
	file, _ := os.Create(filePath)
	defer file.Close()
	json.NewEncoder(file).Encode(results)

	fmt.Printf("💾 Saved %d anime(s) to %s\n", len(results), filePath)
}

func scrapeAnimeDetails(ctx context.Context, url string) (*Anime, error) {
	childCtx, cancel := chromedp.NewContext(ctx)
	defer cancel()

	var details Anime
	err := chromedp.Run(childCtx,
		chromedp.Navigate(url),
		chromedp.WaitVisible(".clearfix img.cover"),
		chromedp.EvaluateAsDevTools(`
			(() => {
				const coverImg = document.querySelector('.clearfix img.cover')?.src || '';
				const sinopsis = document.querySelector('.clearfix .sinops')?.innerText || '';
				const infoItems = [...document.querySelectorAll('.infopost li')].map(li => li.innerText);
				const otherEpisodes = [...document.querySelectorAll('.bottom-line a')].map(a => ({
					title: a.textContent.trim(),
					url: a.href
				}));
				return {coverImg, sinopsis, infoItems, otherEpisodes};
			})()
		`, &details),
	)
	if err != nil {
		return nil, err
	}

	var episodes []EpisodeData
	for _, ep := range details.OtherEpisodes {
		epData, err := scrapeEpisode(ctx, ep.URL, ep.Title)
		if err == nil {
			episodes = append(episodes, epData)
		}
	}
	details.Episodes = episodes
	return &details, nil
}

func scrapeEpisode(ctx context.Context, url string, title string) (EpisodeData, error) {
	childCtx, cancel := chromedp.NewContext(ctx)
	defer cancel()

	var data struct {
		IframeSrc string
		Options   []string
	}
	err := chromedp.Run(childCtx,
		chromedp.Navigate(url),
		chromedp.WaitReady("body"),
		chromedp.EvaluateAsDevTools(`
			(() => {
				const iframe = document.querySelector('#istream');
				const select = document.querySelector('.mirvid');
				const options = select ? [...select.querySelectorAll('option')].map(o => o.textContent.trim()) : [];
				return { iframeSrc: iframe ? iframe.src : '', options };
			})()
		`, &data),
	)
	if err != nil {
		return EpisodeData{}, err
	}
	return EpisodeData{Title: title, URL: url, IframeSrc: data.IframeSrc, Options: data.Options}, nil
}