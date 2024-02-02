import { App } from "@/app";
import { AuthRoute } from "@routes/auth.route";
import { UserRoute } from "@routes/users.route";
import { ValidateEnv } from "@utils/validateEnv";
import { IndexRoute } from "@routes/index.route";
import { TokenRoute } from "./routes/token.route";
import { ChatRoute } from "./routes/chat.route";

ValidateEnv();

const app = new App([new IndexRoute(), new UserRoute(), new AuthRoute(), new TokenRoute(), new ChatRoute()]);

app.listen();
