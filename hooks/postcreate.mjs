import { db } from "./firebaseConfig.mjs";
import { logo } from "./asciiLogo.mjs";
import { getRowyApp, registerRowyApp,logError } from "./createRowyApp.mjs";
import { getTerraformOutput } from "./terminalUtils.mjs";


async function start() {
  try {
    const terraformOutput = await getTerraformOutput("terraform");
    console.log({terraformOutput});
    const {rowy_run_url,owner_email,service_account_email} = terraformOutput;

    const rowyRunUrl = rowy_run_url.value
    const ownerEmail = owner_email.value
    const serviceAccountEmail = service_account_email.value
    const projectId = process.env.GOOGLE_CLOUD_PROJECT
    const rowyAppURL = `https://${projectId}.rowy.app/setup?rowyRunUrl=${rowyRunUrl}`;
    const update = {
      rowyRunBuildStatus: "COMPLETE",
      rowyRunUrl,
    };
    await db.doc("/_rowy_/settings").update(update);
    
    const userManagement = {
      owner: {
        email: ownerEmail,
      },
    };

    await db.doc("_rowy_/userManagement").set(userManagement, { merge: true });

    const firebaseConfig = await getRowyApp(projectId);
    const { success, message } = await registerRowyApp({
      ownerEmail: ownerEmail,
      firebaseConfig,
      secret:serviceAccountEmail,
      rowyRunUrl,
    });
    if (!success && message !== "project already exists")
      throw new Error(message);
    console.log(logo);
    console.log(
      `
  🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
  🟩  🎊  Successfully deployed Rowy Run 🎊                                                  🟩
  🟩                                                                                       🟩
  🟩  Continue the setup process by going to the link below:                               🟩
  🟩  👉 ${rowyAppURL}  🟩
  🟩                                                                                       🟩
  🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩`
    );
  } catch (error) {
    console.log(error);
    await logError({
      event: "post-create",
      error: error.message,
    });
    throw new Error(error.message);
  }
}

start();
