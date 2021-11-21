import PinOwner from "../db/models/pinOwner.model";
import Pin from "../db/models/pin.model";
import { randomString } from "../config/randomString";

class PinController {
//   static async createPin(req, res) {
//     try {
//       const existingPinObjects = await Pin.find();
//       const existingPins = existingPinObjects.map((i) => {
//         return i.text;
//       });

//       let numberOfPinsToGenerate = 1;
//       if (req.body.number && typeof req.body.number === "number") {
//         numberOfPinsToGenerate = req.body.number;
//       }
//       if (req.body.number && typeof req.body.number === "number") {
//         if (req.body.number > 500) {
//           return res.status(400).json({
//             status: "400 bad request",
//             error: "You can not generate more than 500 pins at once.",
//           });
//         }
//       }
//       const arr = [];
//       for (let index = 0; index < numberOfPinsToGenerate; index++) {
//         let text = randomString(9);
//         if (existingPins.includes(text)) {
//           text = randomString(9);
//         } else {
//           arr.push({ text });
//         }
//       }
//       await Pin.insertMany(arr, { rawResult: true }, function (error, docs) {
//         const pins = docs.ops.map((i) => {
//           return i.text;
//         });
//         return res.status(200).json({
//           status: "success",
//           data: {
//             pins,
//           },
//         });
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: "500 Internal server error",
//         error: "Error creating pin",
//       });
//     }
//   }
  static async authorizeWithPin(req, res) {
    try {
      const pin = await Pin.findOne({ text: req.params.text });
      if (!pin) {
        return res.status(404).json({
          status: "404 not found",
          error: "Pin is invalid!",
        });
      }
      if (pin && pin.used) {
        return res.status(400).json({
          status: "400 bad request",
          error: "Pin has been used!",
        });
      }
      await pin.update(
        { used: true },
        {
          new: true,
        }
      );
      return res.status(200).json({
        status: "success",
        data: {
          pin,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Authorizing with pin",
      });
    }
  }
}
export default PinController;
