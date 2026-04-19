import dotenv from "dotenv";

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "neurograph-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  neo4j: {
    uri: process.env.NEO4J_URI || "",
    username: process.env.NEO4J_USERNAME || "",
    password: process.env.NEO4J_PASSWORD || "",
    database: process.env.NEO4J_DATABASE || "neo4j"
  }
};

export default env;

