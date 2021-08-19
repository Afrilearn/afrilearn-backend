const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const sendWhatsappMessge = (body, mediaUrl) => {
  const data = {
    from: "whatsapp:+14155238886",
    body,
    to: "whatsapp:+2348051544949",
  };
  if (mediaUrl) {
    data.mediaUrl = mediaUrl;
  }
  client.messages
    .create(data)
    .then((message) => console.log(message.sid))
    .catch((error) => console.log("error", error));
};
// sendWhatsappMessge("Hi Usman");
export default sendWhatsappMessge;
