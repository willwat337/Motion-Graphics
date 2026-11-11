import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
// WebGL (Three.js) needs a GL backend in headless Chrome.
// "angle" uses the GPU; on a machine without one, pass --gl=swangle.
Config.setChromiumOpenGlRenderer('angle');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
