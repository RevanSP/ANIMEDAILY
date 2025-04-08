import Layout from "./layout/Layout";
import Head from "next/head";

export default function Home() {

  const features = [
    {
      icon: "bi-play",
      title: "Start Watching",
      description: "Click on any anime and start streaming instantly without waiting."
    },
    {
      icon: "bi-patch-check",
      title: "Enjoy Seamlessly",
      description: "Sit back, relax, and enjoy a seamless streaming experience."
    },
    {
      icon: "bi-search",
      title: "Browse Content",
      description: "Find your favorite anime quickly with our easy-to-use search features."
    },
    {
      icon: "bi-bookmark-check",
      title: "Watchlist",
      description: "Save your favorite anime and episodes for easy access later."
    },
    {
      icon: "bi-shield-check",
      title: "Secure Streaming",
      description: "Your data is always protected with our state-of-the-art security measures."
    },
    {
      icon: "bi-laptop",
      title: "Cross-Platform Support",
      description: "Watch on any device—whether it’s your phone, tablet, or desktop."
    }
  ];

  return (
    <>
      <Head>
        <title>ANIMEDAILY</title>
        <meta name="description" content="Your go-to platform for daily anime news, reviews, and updates." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="ANIMEDAILY - Your Daily Anime Source" />
        <meta property="og:description" content="Stay updated with the latest anime news, reviews, and articles at ANIMEDAILY." />
        <meta property="og:image" content="https://animedaily.vercel.app/favicon.avif" />
        <meta property="og:url" content="https://animedaily.vercel.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="en" />
        <meta name="author" content="Rxvxn" />
        <link rel="canonical" href="https://animedaily.vercel.app" />
      </Head>
      <Layout>
        <section className="py-10">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div className="text-center" key={index}>
                  <div className="bg-orange rounded-full p-6 inline-block mb-4">
                    <i className={`bi ${feature.icon} text-5xl`}></i>
                  </div>
                  <h1 className="text-xl font-semibold mb-2">{feature.title}</h1>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}