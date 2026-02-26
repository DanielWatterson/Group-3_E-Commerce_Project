const isTruthy = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

const isNgrokEnabled = () => isTruthy(process.env.ENABLE_NGROK);

let activeNgrokListener = null;

const getTunnelUrl = (listener) => {
  if (!listener) {
    return null;
  }

  if (typeof listener.url === "function") {
    return listener.url();
  }

  if (typeof listener.url === "string") {
    return listener.url;
  }

  if (typeof listener.public_url === "string") {
    return listener.public_url;
  }

  return null;
};

const resolveNgrokConnect = async () => {
  try {
    const ngrokModule = await import("@ngrok/ngrok");
    const connect = ngrokModule.connect || ngrokModule.default?.connect;
    if (typeof connect !== "function") {
      throw new Error("Ngrok SDK loaded but connect() is unavailable");
    }
    return connect;
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      throw new Error('Missing dependency "@ngrok/ngrok". Run: npm install @ngrok/ngrok');
    }
    throw error;
  }
};

export const startNgrokTunnel = async (port) => {
  if (!isNgrokEnabled()) {
    return null;
  }

  const authtoken = String(process.env.NGROK_AUTHTOKEN || "").trim();
  if (!authtoken) {
    throw new Error("ENABLE_NGROK is true but NGROK_AUTHTOKEN is missing");
  }

  const connect = await resolveNgrokConnect();

  const options = {
    addr: Number(port),
    authtoken,
  };

  const domain = String(process.env.NGROK_DOMAIN || "").trim();
  if (domain) {
    options.domain = domain;
  }

  activeNgrokListener = await connect(options);
  const tunnelUrl = getTunnelUrl(activeNgrokListener);

  if (!tunnelUrl) {
    throw new Error("Ngrok tunnel started but no public URL was returned");
  }

  process.env.BACKEND_BASE_URL = tunnelUrl;
  console.log(`Ngrok tunnel started: ${tunnelUrl} -> http://localhost:${port}`);

  return tunnelUrl;
};

export const stopNgrokTunnel = async () => {
  if (!activeNgrokListener) {
    return;
  }

  if (typeof activeNgrokListener.close === "function") {
    await activeNgrokListener.close();
  }

  activeNgrokListener = null;
  console.log("Ngrok tunnel closed");
};
