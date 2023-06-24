export const extractPrefsFromLocals = (locals: App.Locals) => {
	const { "Proxy Thumbnails": proxy, Restricted: restricted } =
		locals.preferences;
	return { proxy, restricted };
};
