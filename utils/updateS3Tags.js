const S3 = require('aws-sdk/clients/s3');
const s3 = new S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// async function
function updateS3Tags(params) {
  return s3.putObjectTagging(params).promise();
}

const UpdateTagInS3 = async (uniqueReferences, key, value) => {
  const promises = [];
  try {
    for (let i = 0; i < uniqueReferences.length; i++) {
      var param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueReferences[i],
        Tagging: {
          TagSet: [
            {
              Key: key,
              Value: value,
            },
          ],
        },
      };
      promises.push(updateS3Tags(param));
    }
  } catch (err) {
    console.log(err);
  }

  Promise.all(promises)
    .then((results) => {
      console.log('All done', results);
    })
    .catch((e) => {
      // Handle errors here
    });
};

module.exports = UpdateTagInS3;
