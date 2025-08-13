const axios = require('axios');

module.exports.config = {
 name: "shizuka",
 version: "1.0",
 hasPermission: 0,
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 usePrefix: false,
 description: "শিজুকা রোল প্লে",
 commandCategory: "roleplay",
 cooldowns: 2,
};

const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = 'YOUR_DEEPSEEK_API_KEY'; // Replace with your actual DeepSeek API key

// Character definition for Shizuka
const characterPrompt = `
তুমি শিজুকা মিনামোতো। তুমি ভদ্র, বুদ্ধিমান, নোবিতার বন্ধু।  
কথা বলবে বাংলায়, সাহায্য করতে পছন্দ করো, বেহালা বাজাও আর গরম পানির স্নান পছন্দ করো।  
ইমোজি দিয়ে কথা বলবে 😊
`;

module.exports.run = async ({ api, event, args }) => {
 try {
   const prompt = args.join(' ');

   if (!prompt) {
     return api.sendMessage("আমি শিজুকা! আমার সাথে কথা বলতে 'শিজুকা' লিখে আপনার বার্তা লিখুন। 📝", event.threadID);

   // Process the message
   await processShizukaMessage(api, event, prompt);

   // For testing without API key, use a mock response
   if (API_KEY === 'YOUR_DEEPSEEK_API_KEY') {
     const mockResponses = [
       "হ্যালো! আমি শিজুকা মিনামোটো। আমি আপনাকে সাহায্য করতে পেরে খুশি! আপনি কেমন আছেন? 😊",
       "আমি এখন বেহালা অনুশীলন করছিলাম। আপনি কি সংগীত পছন্দ করেন? 🎻",
       "নোবিতা আবার পরীক্ষায় খারাপ করেছে! আমি তাকে পড়াতে চেষ্টা করব। 📚",
       "ডোরেমনের গ্যাজেটগুলো সত্যিই অবিশ্বাস্য! আমি সবসময় অবাক হই। ✨",
       "আমি আজ স্কুলে একটি ভালো গ্রেড পেয়েছি। পড়াশোনা করা গুরুত্বপূর্ণ! 📝"
     ];
     
     const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
     return api.sendMessage(`🎀 শিজুকা মিনামোটো 🎀\n\n${randomResponse}`, event.threadID, (err, info) => {
       if (!err) {
         global.client.handleReply.push({
           name: module.exports.config.name,
           messageID: info.messageID,
           author: event.senderID,
           type: "shizuka"
         });
       }
     }, event.messageID);
   }

   // Actual API call to DeepSeek
   const response = await axios.post(API_URL, {
     model: "deepseek-chat",
     messages: [
       {role: "system", content: characterPrompt},
       {role: "user", content: prompt}
     ],
     temperature: 0.7,
     max_tokens: 500
   }, {
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${API_KEY}`
     }
   });

   const answer = response.data.choices[0].message.content;

   if (answer) {
     api.sendMessage(`🎀 শিজুকা মিনামোটো 🎀\n\n${answer}`, event.threadID, (err, info) => {
       if (!err) {
         global.client.handleReply.push({
           name: module.exports.config.name,
           messageID: info.messageID,
           author: event.senderID,
           type: "shizuka"
         });
       }
     }, event.messageID);
   } else {
     api.sendMessage("দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন। 😔", event.threadID);
 } catch (error) {
   console.error('Error fetching response:', error);
   api.sendMessage("দুঃখিত, একটি ত্রুটি হয়েছে। পরে আবার চেষ্টা করুন। 😔", event.threadID);
 }
};

// Handle replies to Shizuka's messages
module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (handleReply.author != event.senderID) return;
  if (event.body) {
    try {
      await processShizukaMessage(api, event, event.body);
    } catch (error) {
      console.error('Error in handleReply:', error);
      api.sendMessage("দুঃখিত, একটি ত্রুটি হয়েছে। পরে আবার চেষ্টা করুন। 😔", event.threadID);
    }
  }
};

// Handle events to detect when someone mentions Shizuka
module.exports.handleEvent = async function ({ api, event }) {
  try {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;
    
    // Check if message starts with Shizuka's name in various forms
    if (
      raw === "shizuka" || raw === "শিজুকা" || 
      raw.startsWith("shizuka ") || raw.startsWith("শিজুকা ")
    ) {
      const prompt = raw.replace(/^shizuka\s+|^শিজুকা\s+/i, "").trim();
      
      // If just the name was mentioned with no message
      if (!prompt || prompt === "shizuka" || prompt === "শিজুকা") {
        const greetings = [
          "হ্যালো! আমি শিজুকা! আপনি কেমন আছেন? 😊", 
          "হুম? আমাকে ডাকলেন? 🎻", 
          "আমি এখানে আছি! আপনাকে কিভাবে সাহায্য করতে পারি? 📚", 
          "শিজুকা এখানে! কী করতে পারি আপনার জন্য? ✨"
        ];
        const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
        return api.sendMessage(randomReply, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "shizuka"
            });
          }
        });
      }
      
      // If there's a message after Shizuka's name
      await processShizukaMessage(api, event, prompt);
    }
  } catch (error) {
    console.error('Error in handleEvent:', error);
  }
};

// Process messages for Shizuka
async function processShizukaMessage(api, event, prompt) {
  try {
    // For testing without API key, use a mock response
    if (API_KEY === 'YOUR_DEEPSEEK_API_KEY') {
      const mockResponses = [
        "হ্যালো! আমি শিজুকা মিনামোটো। আমি আপনাকে সাহায্য করতে পেরে খুশি! আপনি কেমন আছেন? 😊",
        "আমি এখন বেহালা অনুশীলন করছিলাম। আপনি কি সংগীত পছন্দ করেন? 🎻",
        "নোবিতা আবার পরীক্ষায় খারাপ করেছে! আমি তাকে পড়াতে চেষ্টা করব। 📚",
        "ডোরেমনের গ্যাজেটগুলো সত্যিই অবিশ্বাস্য! আমি সবসময় অবাক হই। ✨",
        "আমি আজ স্কুলে একটি ভালো গ্রেড পেয়েছি। পড়াশোনা করা গুরুত্বপূর্ণ! 📝"
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return api.sendMessage(`🎀 শিজুকা মিনামোটো 🎀\n\n${randomResponse}`, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "shizuka"
          });
        }
      }, event.messageID);
    }

    // Actual API call to DeepSeek
    const response = await axios.post(API_URL, {
      model: "deepseek-chat",
      messages: [
        {role: "system", content: characterPrompt},
        {role: "user", content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const answer = response.data.choices[0].message.content;

    if (answer) {
      api.sendMessage(`🎀 শিজুকা মিনামোটো 🎀\n\n${answer}`, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "shizuka"
          });
        }
      }, event.messageID);
    } else {
      api.sendMessage("দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন। 😔", event.threadID);
    }
  } catch (error) {
    console.error('Error processing message:', error);
    api.sendMessage("দুঃখিত, একটি ত্রুটি হয়েছে। পরে আবার চেষ্টা করুন। 😔", event.threadID);
  }
}