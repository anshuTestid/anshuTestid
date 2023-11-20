const { google } = require("googleapis");
const fs = require("fs");

// const apiKey = process.env.YOUTUBE_API_KEY;
const apiKey = "AIzaSyBGIIio4k0PO5xrmGJJLp-J3UPNW1p6nlg";
const channelId = "UCaYr5yxgOyk599Mnb3TGh-g"; // Replace with your YouTube channel ID
const maxResults = 5;

const youtube = google.youtube({
  version: "v3",
  auth: apiKey,
});

async function fetchLatestVideos() {
  try {
    const response = await youtube.search.list({
      part: "snippet",
      channelId: channelId,
      order: "date",
      type: "video",
      maxResults: maxResults,
    });

    const videos = response.data.items.map((item) => {
      return {
        title: item.snippet.title,
        videoId: item.id.videoId,
      };
    });

    return videos;
  } catch (error) {
    console.error("Error fetching latest videos:", error.message);
    throw error;
  }
}

async function updateReadme(videos) {
  try {
    const readmePath = "README.md";
    let readmeContent = fs.readFileSync(readmePath, "utf-8");

    // Find and replace the placeholder with the actual video information
    const startTag = "<!-- latest-videos -->";
    const endTag = "<!-- latest-videos-end -->";
    const startIdx = readmeContent.indexOf(startTag) + startTag.length;
    const endIdx = readmeContent.indexOf(endTag);

    const videosMarkdown = videos
      .map((video) => {
        return `* [${video.title}](https://www.youtube.com/watch?v=${video.videoId})`;
      })
      .join("\n");

    readmeContent =
      readmeContent.substring(0, startIdx) +
      "\n" +
      videosMarkdown +
      "\n" +
      readmeContent.substring(endIdx);

    fs.writeFileSync(readmePath, readmeContent, "utf-8");
    console.log("Updated README with latest videos.");
  } catch (error) {
    console.error("Error updating README:", error.message);
    throw error;
  }
}

async function run() {
  try {
    const videos = await fetchLatestVideos();
    await updateReadme(videos);
  } catch (error) {
    console.error("Workflow failed:", error.message);
    process.exit(1);
  }
}

run();
