const parseMDSource = (source: string) => {
  return source
    .replace(/\n/gi, "\n&#8203;")
    .replace(/\n&#8203;>/gi, "\n >")
    .replace(/\n&#8203;*/gi, "\n");
};

export default parseMDSource;
