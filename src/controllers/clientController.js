import Client from "../models/Client.js";

export async function createClient(req, res) {
  try {
    const {
      agencyOwnerId,
      name,
      industry = "",
      contactName = "",
      email = "",
      phone = "",
      pageId = "",
      pageName = ""
    } = req.body;

    if (!agencyOwnerId || !name) {
      return res.status(400).json({
        message: "agencyOwnerId and name are required"
      });
    }

    const client = await Client.create({
      agencyOwnerId,
      name,
      industry,
      contactName,
      email,
      phone,
      pageId,
      pageName
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getClients(req, res) {
  try {
    const { agencyOwnerId } = req.query;

    if (!agencyOwnerId) {
      return res.status(400).json({
        message: "agencyOwnerId is required"
      });
    }

    const clients = await Client.find({ agencyOwnerId }).sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getClientById(req, res) {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateClient(req, res) {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const {
      name,
      industry,
      contactName,
      email,
      phone,
      pageId,
      pageName,
      status
    } = req.body;

    if (typeof name === "string") client.name = name;
    if (typeof industry === "string") client.industry = industry;
    if (typeof contactName === "string") client.contactName = contactName;
    if (typeof email === "string") client.email = email;
    if (typeof phone === "string") client.phone = phone;
    if (typeof pageId === "string") client.pageId = pageId;
    if (typeof pageName === "string") client.pageName = pageName;
    if (typeof status === "string") client.status = status;

    await client.save();

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteClient(req, res) {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    await client.deleteOne();

    res.json({ message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}