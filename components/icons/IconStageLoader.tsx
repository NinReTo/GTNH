"use client";

import dynamic from "next/dynamic";

/** Общий холст значков грузится только в браузере: на сервере рисовать трёхмерное нечем. */
export const IconStageLoader = dynamic(() => import("./IconStage"), { ssr: false });
