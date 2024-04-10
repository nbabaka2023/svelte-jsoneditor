/**
 * Return a human readable document size
 * For example formatSize(7570718) outputs '7.6 MB'
 * @param size
 * @param kilo Is 1000 by default, you can specify 1024 if you
 *                             want the output in KiB
 * @return Returns a human readable size
 */
export declare function formatSize(size: number, kilo?: number): string;
