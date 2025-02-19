import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import readline from 'readline';
import cfonts from "cfonts";

dotenv.config();  // Load environment variables

// Check if domain.txt exists and read domains
const DOMAIN_FILE = 'domain.txt';
const URLDOMAINS = fs.existsSync(DOMAIN_FILE) ? fs.readFileSync(DOMAIN_FILE, 'utf8').split('\n').filter(Boolean) : [];

if (URLDOMAINS.length === 0) {
    console.error('❌ domain.txt is missing or empty!');
    process.exit(1);  // Exit the script if no domains are provided
}

const AUTHORIZE_TOKEN = process.env.AUTHORIZE_TOKEN;
const KEYWORDS_FILE = process.env.KEYWORDS_FILE;
const INTERVAL = parseInt(process.env.INTERVAL, 10);

// Log file path
const LOG_FILE = 'CryptoAirdropHindi';

// Function to log messages to the log file
const logToFile = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);  // Append to the log file
};

const readKeywords = () => {
    if (!fs.existsSync(KEYWORDS_FILE)) {
        throw new Error("File keywords.txt tidak ditemukan!");
    }
    return fs.readFileSync(KEYWORDS_FILE, 'utf8').split('\n').filter(Boolean);
};

const getRandomKeyword = (keywords) => {
    return keywords[Math.floor(Math.random() * keywords.length)];
};

const getRandomUrlDomain = () => {
    return URLDOMAINS[Math.floor(Math.random() * URLDOMAINS.length)];
};

const sendRequest = async (keyword) => {
    const urlDomain = getRandomUrlDomain();
    const logMessage = `🔍 Keyword: ${keyword}, 🌐 Using Domain: ${urlDomain}`;
    logToFile(logMessage);  // Log the request

    console.log("\n==============================");
    console.log(`🔍 Keyword: ${keyword}`);
    console.log(`🌐 Using Domain: ${urlDomain}`);
    console.log("==============================");

    const data = {
        messages: [
            { role: "system", content: "You are an AI assistant." },
            { role: "user", content: keyword }
        ]
    };

    try {
        const response = await fetch(urlDomain, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AUTHORIZE_TOKEN}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error("No response from server");
        }
        
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || "[No response received]";
        
        console.log("✅ Response:");
        console.log("------------------------------");
        console.log(content);
        console.log("------------------------------\n");

        logToFile(`Response: ${content}`);  // Log the response
    } catch (error) {
        // Log the error
        logToFile(`Error: ${error.message}`);
        // Optionally log the error in the console too (for visibility)
        console.error("❌ Error: ", error.message);
    }
};

const startProcess = async (processIndex, keywords) => {
    while (true) {
        const keyword = getRandomKeyword(keywords);
        await sendRequest(keyword);
        console.log(`🔄 Proses ${processIndex} menunggu ${INTERVAL / 1000} detik...`);
        await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

cfonts.say("CryptoAirdropHindi", {
    font: "block",
    align: "center",
    colors: ["cyan", "magenta"],
    background: "black",
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: "0",
});

console.log("=== Telegram Channel : CryptoAirdropHindi (@CryptoAirdropHindi) ===", "\x1b[36m");
console.log("Follow us on social media for updates and more:");
console.log("📱 Telegram: https://t.me/Crypto_airdropHM");
console.log("🎥 YouTube: https://www.youtube.com/@CryptoAirdropHindi6");
console.log("💻 GitHub Repo: https://github.com/CryptoAirdropHindi/");


rl.question("Enter the desired number of processes: ", (answer) => {
    const processCount = parseInt(answer, 10);
    if (isNaN(processCount) || processCount <= 0) {
        console.log("❌ Invalid process count!");
        process.exit(1);
    }
    console.log(`🚀 Operate ${processCount} proses...`);
    
    const keywords = readKeywords();
    for (let i = 1; i <= processCount; i++) {
        startProcess(i, keywords);
    }
    rl.close();
});
