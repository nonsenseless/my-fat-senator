
export class Utilities {
	constructor(){}

	public static slugify = (name: string) => {
		return name.trim().toLowerCase().replace(" ", "_");
	}
}