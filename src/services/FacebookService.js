import axios from "axios";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v25.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function getFacebookLoginUrl() {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: process.env.META_REDIRECT_URI,
    scope: "pages_show_list,pages_manage_posts,pages_read_engagement"
  });

  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(code) {
  const { data } = await axios.get(`${GRAPH_BASE}/oauth/access_token`, {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.META_REDIRECT_URI,
      code
    }
  });

  return data.access_token;
}

export async function getCurrentUserProfile(userAccessToken) {
  const { data } = await axios.get(`${GRAPH_BASE}/me`, {
    params: {
      fields: "id,name",
      access_token: userAccessToken
    }
  });

  return data;
}

export async function fetchManagedPages(userAccessToken) {
  const { data } = await axios.get(`${GRAPH_BASE}/me/accounts`, {
    params: {
      access_token: userAccessToken
    }
  });

  return data.data || [];
}

export async function publishPhotoToPage({
  pageId,
  pageAccessToken,
  imageUrl,
  caption
}) {
  const { data } = await axios.post(`${GRAPH_BASE}/${pageId}/photos`, null, {
    params: {
      url: imageUrl,
      caption,
      access_token: pageAccessToken
    }
  });

  return data;
}