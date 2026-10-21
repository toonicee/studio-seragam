export interface Column<T> {
	key: string;
	label: string;
	/** Nilai untuk mengurutkan; kolom tanpa `sort` tidak bisa diurutkan */
	sort?: (row: T) => string | number;
	class?: string;
}
