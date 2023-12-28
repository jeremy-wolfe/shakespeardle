import {$, RootTemplate, comment, css, raw} from '@elevensolutions/htts';
import {readFileSync} from 'fs';
import {i, symbol, use} from './icons.js';

const attribution = readFileSync('node_modules/@fortawesome/fontawesome-svg-core/attribution.js').toString().replace(/.*`(.*)`.*/s, '$1');
const hash = process.argv[2];

const arrowLength = 330;
const arrowLengthShort = 260;

const template = new RootTemplate([
	$.head([
		$.meta({charset: 'utf-8'}),
		$.meta({name: 'viewport', content: 'width=device-width, initial-scale=1'}),
		$.meta({name: 'theme-color', content: '#111111'}),
		$.title('Shakespeardle'),
		$.link({rel: 'manifest', href: '/assets/site.webmanifest?v2'}),
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
				$('#grid-toggle-btn')([i('calendar-day'), use('dice')]),
				$('#stats-btn')(i('chart-simple')),
				$.h1(['Shakespear', $.span('dl'), 'e']),
				$.svg({viewBox: `0 0 ${arrowLength + 2} 45`}, [
					$('path#arrow-tail')({d: `M1,19 l4,4 l-4,4 m4,-8 l4,4 l-4,4 m4,-8 l4,4 l-4,4 m4,-8 l4,4 l-4,4 m4,-8 l4,4 l-4,4`}),
					$('path#arrow-head')({d: `M${arrowLength},23 l-10,-4 l2,4 l-2,4z`}),
					$('path#arrow-long')({d: `M5,23 L${arrowLength},23`}),
					$('path#arrow-short')({d: `M5,23 L${arrowLengthShort},23`})
				]),
			]),
			$.main,
			$.footer
		]),
		$.aside([
			$('.close')([$.svg({viewBox: '0 0 40 40'}, [$.path({d: 'M0,0 L40,40 M0,40 L40,0'})])]),
			$.header([
				$.h2('Statistics'),
				$.ul([
					$.li([$.b, 'played']),
					$.li([$.b, 'won']),
					$.li([$.b, 'streak']),
					$.li([$.b, 'best streak'])
				])
			]),
			$('#definition'),
			$.figure([$.h2('Guess Distribution')]),
			$.footer([
				$.div([
					$('a.btn.github')(
						{href: 'https://github.com/jeremy-wolfe/shakespeardle', target: '_blank'},
						[i('github', 'fab'), 'GitHub']
					),
					$('.btn.share')([i('share-nodes'), 'Share'])
				]),
				$.small([
					'This project is licensed under the ',
					$.a({href: 'https://github.com/jeremy-wolfe/shakespeardle/blob/main/LICENSE.txt', target: '_blank', title: 'Mozilla Public License 2.0'}, 'MPL-2.0'),
					'. Concept and rules based on ',
					$.a({href: 'https://www.nytimes.com/games/wordle/index.html', target: '_blank'}, 'Wordle'),
					'. Word list compiled from ', $.i('Shakespeare’s Plays, Sonnets and Poems'), ' from ',
					$.a({href: 'https://shakespeare.folger.edu/', target: '_blank'}, 'The Folger Shakespeare'),
					'. Definitions from ', $.i('A Shakespeare Glossary'), ' by C. T. Onions, via ',
					$.a({href: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.03.0068', target: '_blank'}, 'Perseus Digital Library'), '.'
				])
			])
		]),
		$('#loading')([$.img({src: '/assets/loading.svg?v2', alt: 'Loading'})]),
		$('#shade'),
		raw`\n\n`,
		comment(`\nIcons provided by ${attribution}`),
		$.svg({style: {display: 'none'}}, [
			symbol('circle-check'),
			symbol('delete-left'),
			symbol('dice')
		]),
		raw`\n\n`
	])
]);

console.log(template.renderString());
