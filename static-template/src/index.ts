import {$, RawContent, RootTemplate, comment, css, raw} from '@elevensolutions/htts';
import {IconName, IconPrefix, icon, library, toHtml} from '@fortawesome/fontawesome-svg-core';
import {faGithub} from '@fortawesome/free-brands-svg-icons';
import {faCalendarDay, faChartSimple, faCircleCheck, faDeleteLeft, faDice, faShareNodes} from '@fortawesome/free-solid-svg-icons';
import {readFileSync} from 'fs';

library.add(faChartSimple, faCalendarDay, faDice, faGithub, faShareNodes, faDeleteLeft, faCircleCheck);

function i(iconName: IconName, prefix: IconPrefix = 'fas'): RawContent {
	return raw(icon({iconName, prefix}).html.join(''));
}

function symbol(iconName: IconName, prefix?: IconPrefix): RawContent {
	const svg = icon({iconName, prefix}).abstract[0];
	svg.tag = 'symbol';
	svg.attributes.id = 'icon-' + iconName;
	return raw(toHtml(svg));
}

const attribution = readFileSync('node_modules/@fortawesome/fontawesome-svg-core/attribution.js').toString().replace(/.*`(.*)`.*/s, '$1');

const hash = process.argv[2];

const template = new RootTemplate([
	$.head([
		$.meta({charset: 'utf-8'}),
		$.meta({name: 'viewport', content: 'width=device-width, initial-scale=1'}),
		$.meta({name: 'theme-color', content: '#111111'}),
		$.title('Shakespeardle'),
		$.link({rel: 'manifest', href: '/assets/site.webmanifest'}),
		$.link({rel: 'icon', href: '/assets/icon.svg'}),
		$.link({rel: 'apple-touch-icon', href: '/assets/apple-touch-icon.png'}),
		$.link({rel: 'stylesheet', href: `/index${hash ? '.' + hash : ''}.css`}),
		css`
			body {
				background: #111;
			}
			#container {
				display: none;
			}
			#loading {
				position: fixed;
				left: 50%;
				top: 50%;
				width: 100px;
				height: 100px;
				margin: -50px 0 0 -50px;
				z-index: 12;
			}
		`
	]),
	$.body([
		$('#container')([
			$.header([
				$('#random-btn')(i('dice')),
				$('#daily-btn')(i('calendar-day')),
				$('#stats-btn')(i('chart-simple')),
				$.h1(['Shakespear', $.span('dl'), 'e'])
			]),
			$.main,
			$.footer,
			$.aside([
				$('.close')([$.svg({viewBox: '0 0 40 40'}, [$.path({d: 'M0,0 L40,40 M0,40 L40,0'})])]),
				$.h2('Statistics'),
				$.ul([
					$.li([$.b('played')]),
					$.li([$.b('won')]),
					$.li([$.b('streak')]),
					$.li([$.b('best streak')])
				]),
				$.footer([
					$.div([
						$('a.btn.github')(
							{href: 'https://github.com/CaptainVascular/shakespeardle', target: '_blank'},
							[i('github', 'fab'), 'GitHub']
						),
						$('.btn.share')([i('share-nodes'), 'Share'])
					]),
					$.small([
						'This project is licensed under the terms of the ',
						$.a({href: 'https://github.com/CaptainVascular/shakespeardle/blob/main/LICENSE.txt', target: '_blank'}, 'Mozilla Public License 2.0'),
						'. Concept and rules based on ',
						$.a({href: 'https://www.nytimes.com/games/wordle/index.html', target: '_blank'}, 'Wordle'),
						'. Word list compiled from ', $.i('Shakespeare’s Plays, Sonnets and Poems'), ' from ',
						$.a({href: 'https://shakespeare.folger.edu/', target: '_blank'}, 'The Folger Shakespeare'), '.'
					])
				])
			])
		]),
		$('#loading')([$.img({src: '/assets/loading.svg', alt: 'Loading'})]),
		$('#shade'),
		raw`\n\n`,
		comment(`\nIcons provided by ${attribution}`),
		$.svg({style: {display: 'none'}}, [
			symbol('circle-check'),
			symbol('delete-left')
		]),
		raw`\n\n`
	])
]);

console.log(template.renderString());
