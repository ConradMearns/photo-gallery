#!/usr/bin/env node
import { startServer } from "./server.mjs";
import { Command } from "commander";
import { indexImages } from "./indexer.mjs";

const program = new Command();

program.version("0.1.0").description("CLI for RadServer");

program
  .command("index <directory>")
  .description(
    "recursively collects metadata and SHA256 hashes of image files in the given directory"
  )
  .action(async (directory) => {
    await indexImages(directory);
  });

program
  .command("serve")
  .description("Start the Express app")
  .action(() => {
    console.log("Starting server...");
    startServer();
  });

program.parse(process.argv);
