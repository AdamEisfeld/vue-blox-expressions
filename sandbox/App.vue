<script lang="ts">

import { defineComponent, reactive } from 'vue'
import { BloxComponent } from 'vue-blox'
import { Parser } from 'expr-eval'
import { BloxPluginCompute } from '../src/classes/BloxPluginCompute'
import { BloxPluginEvent } from '../src/classes/BloxPluginEvent'
import StackComponent from './components/StackComponent.vue'
import LabelComponent from './components/LabelComponent.vue'
import ButtonComponent from './components/ButtonComponent.vue'
import CounterComponent from './components/CounterComponent.vue'

export default defineComponent({
	name: 'App',
	components: {
		BloxComponent,
	},
	props: {},
	setup() {

		// 1. Catalog

		const catalog = {
			'stack': StackComponent,
			'label': LabelComponent,
			'button': ButtonComponent,
			'counter': CounterComponent
		}
		
		// 2. Construct variables
		
		const variables = reactive({
			name: 'Adam',
			score: 0,
		})

		// 3. Construct view

		const view = reactive({
			type: 'stack',
			'slot:children': [
				{
					type: 'label',
					'compute:text': 'score + 5',
				},
				{
					type: 'label',
					'compute:text': 'score > 0 ? "Your score is > 0" : "Your score is 0"',
				},
				{
					type: 'counter',
					'bind:count': 'score',
				},
				{
					type: 'button',
					title: 'Click Me',
					'event:clicked': 'console("User clicked the button!")',
				},
			]
		})

		// 4. Construct plugins
		
		const parser = new Parser()
		parser.functions.console = (message: any) => {
			console.log(message)
		}

		const plugins = [
			new BloxPluginCompute(parser),
			new BloxPluginEvent(parser)
		]

		return {
			catalog,
			variables,
			view,
			plugins,
		}
	},
})
</script>

<template>
	<main style="padding: 48px; display: flex; flex-wrap: no-wrap; flex-direction: column; align-items: center; gap: 48px;">
		<img src="/logoExpressions.png" width="200"/>
		<div style="padding: 24px; border-style: solid; border-color: gray; border-radius: 12px;">
			<BloxComponent :catalog="catalog" :view="view" :variables="variables" :plugins="plugins"/>
		</div>
	</main>
</template>
