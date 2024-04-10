/// <reference types="svelte-jsoneditor/assets/svelte-simple-modal/types" />
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        open?: import("svelte-simple-modal").Open | undefined;
        close?: import("svelte-simple-modal").Close | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ModalRefProps = typeof __propDef.props;
export type ModalRefEvents = typeof __propDef.events;
export type ModalRefSlots = typeof __propDef.slots;
export default class ModalRef extends SvelteComponent<ModalRefProps, ModalRefEvents, ModalRefSlots> {
    get open(): import("svelte-simple-modal").Open;
    get close(): import("svelte-simple-modal").Close;
}
export {};
