import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

try {
    const logs = fs.readFileSync("/app/applet/nohup.out", "utf8");
    const lastLines = logs.split("\n").slice(-100).join("\n");
    console.log(lastLines);
} catch(e) {
    console.log("No nohup.out file found.");
}
