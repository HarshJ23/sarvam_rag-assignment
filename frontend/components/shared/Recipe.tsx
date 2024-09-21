import { useEffect, useState } from "react";

interface RecipeVideo {
  duration: string | null;
  link: string;
  published_date: string;
  thumbnail: string;
  title: string;
  views: number;
  recipe_keyword: string;
}

export default function Recipe() {
  const [videos, setVideos] = useState<RecipeVideo[]>([]);

  useEffect(() => {
    const getVideos = async () => {
      try {
        const response = await fetch('http://localhost:8000/recipe_search', {
          method: 'GET',
        });
        if (response.ok) {
          const data = await response.json();
          setVideos(data.recipe_results);
        } else {
          console.error("Failed to fetch recipe data");
        }
      } catch (error) {
        console.error("Error fetching recipe data:", error);
      }
    };

    getVideos();
  }, []); // Empty dependency array ensures this effect runs only once

  // Function to extract the YouTube video ID from a URL
  const extractVideoId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|v\/|embed\/|watch\?v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : "";
  };

  return (
    <div className="flex flex-col h-full overflow-scroll">
      <h1 className="mb-4">Recipe Search Tool</h1>
      <div className="flex-1 overflow-y-scroll">
        {videos.map((video) => {
          const videoId = extractVideoId(video.link);
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          return (
            <div key={video.link} className="my-2">
              <iframe
                className="w-full aspect-video"
                src={embedUrl}
                frameBorder="0"
                title={video.title}
                aria-hidden="true"
                // allowFullScreen
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
