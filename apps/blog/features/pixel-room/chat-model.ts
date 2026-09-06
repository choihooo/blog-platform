/** Development-only candidate; production remains on the existing Kanana model. */
export const NAVER_MODEL = {
  name: "HyperCLOVA X SEED · 1.5B",
  quantization: "q4" as const,
  size: "1.01GB",
  url: "/models/hyperclova-q4-6e0841f886f5-v1/model.gguf",
  sourceUrl:
    "https://huggingface.co/naver-ellm/HyperCLOVAX-SEED-Text-Instruct-1.5B-GGUF/resolve/b9bbb68d6635a8b80263bf7165c8b908d64f28de/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M.gguf",
  sha256: "6e0841f886f55411327d4659308f2408424f0ac55a2d32f60a49f470c71381a6",
};

export const CHAT_MODEL = {
  name: "Kanana 2 · 1.3B",
  quantization: "q8" as const,
  size: "1.38GB",
};
