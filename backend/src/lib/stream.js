import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.TALKIE_API_VALUE;
const apiSecret = process.env.TALKIE_SECRET_KEY;

if (!apiKey || !apiSecret) {
    console.error("Stream API key and secret is missing.");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {   
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error creating Stream user:", error);
    }
}

export const generateStreamToken = (userId) => {
    try {
        //ensure the userId is a string
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error genearting Stram token:", error);
    }
};

