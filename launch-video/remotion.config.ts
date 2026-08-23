import {Config} from "@remotion/cli/config";

Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
// PNG intermediates avoid full-range JPEG color metadata leaking into the H.264
// master. The final encode stays broadcast-safe BT.709-compatible yuv420p.
Config.setVideoImageFormat("png");
Config.setConcurrency(4);
