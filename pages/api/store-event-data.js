import { Web3Storage, File, getFilesFromPath } from "web3.storage";
const { resolve } = require("path");

async function storeFiles(files) {
  // 4. store the raw image data in web3.storage
  const client = makeStorageClient();
  const cid = await client.put(files);
  return cid;
}

function makeStorageClient() {
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}

async function makeFileObjects(body) {
  // 3. params contain image, store it in `data.json`
  const buffer = Buffer.from(JSON.stringify(body));

  const imageDirectory = resolve(process.cwd(), `public/images/${body.image}`);
  let files = await getFilesFromPath(imageDirectory); // lmfao files was "const"

  files.push(new File([buffer], "data.json"));
  return files;
}

async function storeEventData(req, res) {
  const body = req.body;

  // 2. store stuff found in POST params
  try {
    const files = await makeFileObjects(body);
    const cid = await storeFiles(files);
    return res.status(200).json({ success: true, cid: cid });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error creating event", success: false });
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    // 1. POST request goes here
    return await storeEventData(req, res);
  } else {
    return res
      .status(405)
      .json({ message: "Method not allowed", success: false });
  }
}