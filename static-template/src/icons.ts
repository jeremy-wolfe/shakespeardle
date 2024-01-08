import {$, RawContent, Tag, raw} from 'whits';
import {IconName, IconPrefix, icon, library, toHtml} from '@fortawesome/fontawesome-svg-core';
import {faCalendarDay, faChartSimple, faCircleCheck, faDeleteLeft, faDice, faShareNodes} from '@fortawesome/free-solid-svg-icons';
import {faGithub} from '@fortawesome/free-brands-svg-icons';

library.add(faChartSimple, faCalendarDay, faDice, faGithub, faShareNodes, faDeleteLeft, faCircleCheck);

export function i(iconName: IconName, prefix: IconPrefix = 'fas'): RawContent {
	return raw(icon({iconName, prefix}).html.join(''));
}

export function symbol(iconName: IconName, prefix?: IconPrefix): RawContent {
	const svg = icon({iconName, prefix}).abstract[0];
	svg.tag = 'symbol';
	svg.attributes.id = 'icon-' + iconName;
	return raw(toHtml(svg));
}

export function use(iconName: IconName): Tag<'svg'> {
	return $.svg([$.use({href: '#icon-' + iconName})]);
}
