/**
 * @author Turtlemay <turtlemay.us>
 * @version 0.0.3
 * @see https://turtlemay.neocities.org/lab/noise-tubes
 */

document.head.prepend(function () {
  const style = document.createElement("style");
  style.textContent = (/*css*/`
    x-noise-tube {
      --noise-tube-scale: 1;
      --tube-height: 100px;
      --slider-height: 10px;
      --cap-color: orange;
      --tube-color: yellow;
      --slider-color: gold;
      --flip-time: 500ms;
      --slide-time: 1000ms;
      --slider-percent: 100;
      display: flex;
      flex-align: center;
      justify-content: center;
      user-select: none;
      cursor: pointer;
      transition: transform 300ms;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        transform: rotate(2deg);
      }

      &:active {
        transform: translateY(5px);
      }

      .noiseTube__layoutContainer {
        display: inline-flex;
        flex-direction: column;
        align-items: safe center;
        justify-content: safe center;
      }

      .noiseTube__topCap,
      .noiseTube__bottomCap {
        width: calc(var(--noise-tube-scale) * 20px);
        height: calc(var(--noise-tube-scale) * 10px);
        background: var(--cap-color);

        &.noiseTube__topCap {
          border-top-left-radius: 2px;
          border-top-right-radius: 2px;
        }

        &.noiseTube__bottomCap {
          border-bottom-left-radius: 2px;
          border-bottom-right-radius: 2px;
        }
      }

      .noiseTube__tube {
        --scaled-tube-height: calc(var(--noise-tube-scale) * var(--tube-height));
        width: calc(var(--noise-tube-scale) * 18px);
        height: var(--scaled-tube-height);
        background: var(--tube-color);
        position: relative;

        .noiseTube__slider {
          --scaled-slider-height: calc(var(--noise-tube-scale) * var(--slider-height));
          --max-top: calc(var(--scaled-tube-height) - var(--scaled-slider-height));
          width: 100%;
          height: var(--scaled-slider-height);
          background: var(--slider-color);
          position: absolute;
          left: 0;
          top: calc(var(--slider-percent)/100 * var(--max-top));
          transition: top var(--slide-time) ease-in-out calc(var(--flip-time) / 2);
        }
      }

      .noiseTube__flippable {
        --slider-percent: 100;
        transition: transform var(--flip-time);

        [data-flip="true"] & {
          --slider-percent: 0;
          transform: rotate(180deg);
        }
      }
    }
  `);
  return style;
}());

customElements.define("x-noise-tube", class NoiseTube extends HTMLElement {
  static AUDIO_SOURCES = [
    "https://res.cloudinary.com/duvlwfbd7/video/upload/sound1_imh2uo.mp3",
    "https://res.cloudinary.com/duvlwfbd7/video/upload/sound2_c6m3a9.mp3",
  ];

  #audio = NoiseTube.AUDIO_SOURCES.map(v => new Audio(v));

  connectedCallback() {
    this.innerHTML = (/*html*/`
      <div class="noiseTube__layoutContainer noiseTube__flippable">
        <div class="noiseTube__topCap"></div>
        <div class="noiseTube__tube">
          <div class="noiseTube__slider"></div>
        </div>
        <div class="noiseTube__bottomCap"></div>
      </div>
    `);

    this.addEventListener("click", () => this.flip());
  }

  flip() {
    const reverse = this.dataset.flip === "true";

    this.dataset.flip = `${!reverse}`;

    if (reverse) {
      setTimeout(() => this.#playAudio(this.#audio[0], this.#getProgress(false)), 300);
    } else {
      setTimeout(() => this.#playAudio(this.#audio[1], this.#getProgress(true)), 300);
    }
  }

  /**
    @param {HTMLAudioElement} el
    @param {number} fromRatio
  */
  #playAudio(el, fromRatio) {
    this.#audio.forEach(v => v.pause());
    if (!el.duration) el.load();
    el.currentTime = (el.duration || 0) * fromRatio;
    el.play();
  }

  /**
    @param {boolean} reverse
    @returns Between 0 and 1.
  */
  #getProgress(reverse) {
    const containerEl = this.querySelector(".noiseTube__tube");
    const progressEl = this.querySelector(".noiseTube__slider");

    const extractNum = str => Number(str.match(/\d+/)[0]);

    const progress = extractNum(getComputedStyle(progressEl).top);
    const subHeight = extractNum(getComputedStyle(progressEl).height);
    const totalHeight = extractNum(getComputedStyle(containerEl).height);
    const calcHeight = () => totalHeight - subHeight;

    const result = progress / calcHeight();
    return reverse ? 1 - result : result;
  }
});
