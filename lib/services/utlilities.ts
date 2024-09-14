
export class Utilities {
	public static slugify = (name: string) => {
		return name.trim().toLowerCase().replace(" ", "_");
	}
}