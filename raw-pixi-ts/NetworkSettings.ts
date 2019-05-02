
import { Url } from "./Url";

export class NetworkSettings
{
	static tempAnchor;
	static RETINA_PREFIX = /@([0-9\.]+)x/;
	static url = {
		parse: Url.urlParse,
		resolve: Url.urlResolve,
		resolveObject: Url.urlResolveObject,
		format: Url.urlFormat,
		Url: Url
	};
	static getResolutionOfUrl(url, defaultValue = null)
	{
	    var resolution = NetworkSettings.RETINA_PREFIX.exec(url);

	    if (resolution)
	    {
	        return parseFloat(resolution[1]);
	    }

	    return defaultValue !== undefined ? defaultValue : 1;
	}
	static determineCrossOrigin(url$1, loc = null)
	{
	    if ( loc === void 0 ) { loc = window.location; }
	    if (url$1.indexOf('data:') === 0)
	    {
	        return '';
	    }
	    loc = loc || window.location;
	    if (!NetworkSettings.tempAnchor)
	    {
	        NetworkSettings.tempAnchor = document.createElement('a');
	    }
		NetworkSettings.tempAnchor.href = url$1;
	    url$1 = NetworkSettings.url.parse(NetworkSettings.tempAnchor.href);
	    var samePort = (!url$1.port && loc.port === '') || (url$1.port === loc.port);
	    if (url$1.hostname !== loc.hostname || !samePort || url$1.protocol !== loc.protocol)
	    {
	        return 'anonymous';
	    }
	    return '';
	}
}