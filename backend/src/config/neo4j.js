import neo4j from "neo4j-driver";
import env from "./env.js";

let driver;

const accessMode = {
  READ: neo4j.session.READ,
  WRITE: neo4j.session.WRITE
};

export function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      env.neo4j.uri,
      neo4j.auth.basic(env.neo4j.username, env.neo4j.password)
    );
  }

  return driver;
}

export function getSession(mode = "WRITE") {
  return getDriver().session({
    database: env.neo4j.database,
    defaultAccessMode: accessMode[mode] || neo4j.session.WRITE
  });
}

export async function runInSession(mode, work) {
  const session = getSession(mode);

  try {
    return await work(session);
  } finally {
    await session.close();
  }
}

export async function verifyConnectivity() {
  await getDriver().verifyConnectivity();
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
  }
}

export async function bootstrapDatabase() {
  await runInSession("WRITE", async (session) => {
    const statements = [
      "CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
      "CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE",
      "CREATE CONSTRAINT session_id IF NOT EXISTS FOR (s:Session) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT question_id IF NOT EXISTS FOR (q:Question) REQUIRE q.id IS UNIQUE",
      "CREATE CONSTRAINT answer_id IF NOT EXISTS FOR (a:Answer) REQUIRE a.id IS UNIQUE",
      "CREATE CONSTRAINT topic_name IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE"
    ];

    for (const statement of statements) {
      await session.run(statement);
    }
  });
}
