const Twitter = require(`twitter`)
require(`dotenv`).config() // load the .env
let path = require(`path`);

(async function () {
  try {
    console.log(process.env.STATUS)

    const client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    })

    const pathToMedia = path.join(__dirname, process.env.MEDIA_PATH)
    const mediaType = process.env.MIME_TYPE

    const mediaData = require(`fs`).readFileSync(pathToMedia)
    const mediaSize = require(`fs`).statSync(pathToMedia).size

    // Declare that you wish to upload some media
    const mediaId = await initUpload({ mediaSize, mediaType, client })
    // Send the data for the media
    await appendUpload({ mediaId, mediaData, client })
    // Declare that you are done uploading chunks
    await finalizeUpload({ mediaId, client })


  } catch (err) {
    console.error(err)
  }

  function initUpload({ mediaSize, mediaType, client }) {
    return makePost(client, `media/upload`, {
      command: `INIT`,
      total_bytes: mediaSize,
      media_type: mediaType,
    }).then(data => data.media_id_string)
  }

  function appendUpload({ mediaId, mediaData, client }) {
    return makePost(client, `media/upload`, {
      command: `APPEND`,
      media_id: mediaId,
      media: mediaData,
      segment_index: 0
    })
  }

  function finalizeUpload({ mediaId, client }) {
    return makePost(client, `media/upload`, {
      command: `FINALIZE`,
      media_id: mediaId
    })
  }

  function makePost(client, endpoint, params) {
    return new Promise((resolve, reject) => {
      client.post(endpoint, params, (error, data, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }

})(Twitter)
