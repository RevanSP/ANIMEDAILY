const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const baseURL = "https://oploverz.co.id/anime-list/";
const logFilePath = path.join(__dirname, "scrape_errors.log");

const BATCH_INDEX = parseInt(process.env.BATCH_INDEX) || 0;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 0;

async function scrapeAnimeList() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  console.log("Navigating to anime list page...");
  await page.goto(baseURL, { waitUntil: "networkidle2", timeout: 60000 });

  console.log("Extracting list of anime URLs...");
  await page.waitForSelector(".maxullink a");
  const animeList = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll(".maxullink a"));
    return links.map((link) => ({
      title: link.textContent.trim(),
      url: link.href,
    }));
  });

  console.log(`Found ${animeList.length} anime(s).`);

  let animeListBatch = animeList;
  if (BATCH_SIZE > 0) {
    const start = BATCH_INDEX * BATCH_SIZE;
    const end = start + BATCH_SIZE;
    animeListBatch = animeList.slice(start, end);
    console.log(
      `Processing batch ${BATCH_INDEX}, items ${start} to ${end - 1}`
    );
  }

  const directoryPath = path.join(__dirname, "src", "data");
  if (!fs.existsSync(directoryPath))
    fs.mkdirSync(directoryPath, { recursive: true });

  const filePath = path.join(directoryPath, "anime.json");
  const animeData = [];

  for (const anime of animeListBatch) {
    console.log(`Scraping details for anime: ${anime.title}`);
    try {
      const details = await scrapeAnimeDetails(browser, anime.url);
      animeData.push({ ...anime, ...details });
    } catch (error) {
      console.error(`Error scraping details for ${anime.title}:`, error);
      logError(`Error scraping details for ${anime.title}: ${error.message}`);
    }
  }

  animeData.sort((a, b) => a.title.localeCompare(b.title));

  console.log("All anime details scraped. Closing browser...");
  await browser.close();

  console.log(`Saving batch data to src/data/anime.json...`);
  fs.writeFileSync(filePath, JSON.stringify(animeData, null, 2));
  console.log(
    `Data saved successfully. Total anime scraped in this batch: ${animeData.length}`
  );
}

async function scrapeAnimeDetails(browser, url) {
  console.log(`Scraping details from URL: ${url}`);
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForSelector(".clearfix img.cover");
  const details = await page.evaluate(() => {
    const coverImg = document.querySelector(".clearfix img.cover")?.src;
    const sinopsis = document.querySelector(".clearfix .sinops")?.innerText;
    const infoItems = Array.from(document.querySelectorAll(".infopost li")).map(
      (li) => li.innerText
    );
    const otherEpisodes = Array.from(
      document.querySelectorAll(".bottom-line a")
    ).map((a) => ({
      title: a.textContent.trim(),
      url: a.href,
    }));

    return { coverImg, sinopsis, infoItems, otherEpisodes };
  });

  const episodeData = await scrapeEpisodes(browser, details.otherEpisodes);
  await page.close();
  return { ...details, episodes: episodeData };
}

async function scrapeEpisodes(browser, episodes) {
  const episodeData = [];
  for (const episode of episodes) {
    const page = await browser.newPage();
    try {
      await page.goto(episode.url, { waitUntil: "networkidle2" });
      const episodeDetails = await page.evaluate(() => {
        const iframeElement = document.querySelector("#istream");
        const iframeSrc = iframeElement ? iframeElement.src : null;

        const selectElement = document.querySelector(".mirvid");
        const options = selectElement
          ? Array.from(selectElement.querySelectorAll("option")).map(
              (option) => ({
                text: option.textContent.trim(),
                value: option.value,
              })
            )
          : [];

        return { iframeSrc, options };
      });

      if (episodeDetails.iframeSrc || episodeDetails.options.length > 0) {
        episodeData.push({ ...episode, ...episodeDetails });
      } else {
        console.warn(
          `No valid iframe or select options found for episode URL: ${episode.url}. Skipping...`
        );
        logError(
          `No valid iframe or select options found for episode URL: ${episode.url}`
        );
      }
    } catch (error) {
      console.error(
        `Error scraping episode URL: ${episode.url}. Skipping...`,
        error
      );
      logError(`Error scraping episode URL: ${episode.url} - ${error.message}`);
    } finally {
      await page.close();
    }
  }
  return episodeData;
}

function logError(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`, "utf8");
}

scrapeAnimeList().catch((error) => {
  console.error("An error occurred:", error);
  logError(`An error occurred: ${error.message}`);
});