#!/usr/bin/env node

import express from "express";
import * as fs from "fs";
import * as path from "path";
import sharp, { Sharp } from "sharp";

import { startServer } from "./server.mjs";

import crypto from "crypto";
import { Command } from "commander";
import { indexImages } from "./indexer";

const program = new Command();

program.version("0.1.0").description("CLI for RadServer");

program
  .command("index <directory>")
  .description(
    "recursively collects metadata and SHA256 hashes of image files in the given directory"
  )
  .action(async (directory: string) => {
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
