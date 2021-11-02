import { Logging } from "@google-cloud/logging";
import { Request } from "express";
import { getProjectId } from "../metadataService";
import { User } from "../types/User";

export const auditChange = async (req: Request, user: User) => {
  const { rowyUser, eventType, eventData } = req.body;
  if (user.uid !== rowyUser.uid) throw new Error("401");

  const projectId = await getProjectId();
  const logging = new Logging({ projectId });
  // Selects the log to write to
  const log = logging.log(`rowy-audit-logs`);
  // The data to write to the log
  // The metadata associated with the entry
  const metadata = {
    resource: {
      type: "global",
    },
    severity: "DEFAULT",
  };
  // Prepares a log entry
  //JSON.stringify()
  const entry = log.entry(metadata, {
    eventType,
    rowyUser,
    eventData,
  });
  return log.write(entry);
};
