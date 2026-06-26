const buildFp = async () => {
  await fetch(process.env.BUILD_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':'Bearer ' + process.env.BUILD_API_KEY
    },
    body: JSON.stringify({
      "SITE_ID": process.env.SITE_ID,
      "BUILD_TYPE": "floorplan"
    }),
})
};

export default buildFp;