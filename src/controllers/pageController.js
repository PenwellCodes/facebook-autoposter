import Page from "../models/Page.js";
import User from "../models/User.js";
import Client from "../models/Client.js";
import { fetchManagedPages } from "../services/facebookService.js";

export async function getPages(req, res) {
  try {
    const { agencyOwnerId, clientId } = req.query;

    if (!agencyOwnerId) {
      return res.status(400).json({ message: "agencyOwnerId is required" });
    }

    const filter = { agencyOwnerId };

    if (clientId) {
      filter.clientId = clientId;
    }

    const pages = await Page.find(filter).sort({ name: 1 });

    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function refreshPages(req, res) {
  try {
    const agencyOwnerId = req.body?.agencyOwnerId || req.query?.agencyOwnerId;

    if (!agencyOwnerId) {
      return res.status(400).json({ message: "agencyOwnerId is required" });
    }

    const user = await User.findById(agencyOwnerId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pages = await fetchManagedPages(user.accessToken);

    for (const page of pages) {
      await Page.findOneAndUpdate(
        {
          agencyOwnerId: user._id,
          pageId: page.id
        },
        {
          agencyOwnerId: user._id,
          pageId: page.id,
          name: page.name,
          category: page.category || "",
          accessToken: page.access_token
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
    }

    return res.json({
      message: "Pages refreshed successfully",
      pagesCount: pages.length
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function assignPageToClient(req, res) {
  try {
    const { agencyOwnerId, clientId, pageId } = req.body;

    if (!agencyOwnerId || !clientId || !pageId) {
      return res.status(400).json({
        message: "agencyOwnerId, clientId, and pageId are required"
      });
    }

    const client = await Client.findOne({
      _id: clientId,
      agencyOwnerId
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const page = await Page.findOne({
      agencyOwnerId,
      pageId
    });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    page.clientId = clientId;
    await page.save();

    return res.json({
      message: "Page assigned to client successfully",
      page
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function unassignPageFromClient(req, res) {
  try {
    const { agencyOwnerId, pageId } = req.body;

    if (!agencyOwnerId || !pageId) {
      return res.status(400).json({
        message: "agencyOwnerId and pageId are required"
      });
    }

    const page = await Page.findOne({
      agencyOwnerId,
      pageId
    });

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    page.clientId = null;
    await page.save();

    return res.json({
      message: "Page unassigned successfully",
      page
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}