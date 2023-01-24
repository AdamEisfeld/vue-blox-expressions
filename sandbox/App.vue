<script lang="ts">

import { defineComponent, watch, reactive } from 'vue'
import { BloxComponent } from 'vue-blox'
import { BloxError } from 'vue-blox'
import { Parser } from 'expr-eval'
import { BloxPluginCompute } from '../src/classes/BloxPluginCompute'
import { BloxPluginEmit } from '../src/classes/BloxPluginEmit'

export default defineComponent({
	name: 'App',
	components: {
		BloxComponent,
	},
	props: {},
	setup() {

		// 1. Construct variables
		
		const variables: any = reactive({
			bar: 'Adam',
			foo: 'Tom',
			baz: 'Joey',
			score: 0,
		})

		// 2. Construct view

		const view: any = {
			type: 'stack',
			'slot:children': [
				{
					type: 'button',
					'on:send-something': 'score > 5 ? foo(1) : bar(2)',
					'bind:message': 'foo',
					'bind:count': 'score',
				},
				{
					type: 'button',
					'compute:message': 'score > 5 ? "Yes" : "No"',
					'bind:count': 'score',
				}
			]
		}

		const parser = new Parser()

		parser.functions.foo = (x: number) => {
			console.log(`clicked ${x}`)
		}
		parser.functions.bar = (x: number) => {
			console.log(`clicked again ${x}`)
		}

		watch(variables, () => {
			console.log('Changes have been made!')
		})

		const onError = (error: any) => {
			const bloxError = BloxError.asBloxError(error)
			if (bloxError) {
				console.log(bloxError.debugMessage)
			} else {
				console.log(error)
			}
		}

		const plugins = [
			new BloxPluginCompute(parser),
			new BloxPluginEmit(parser)
		]

		return {
			variables,
			view,
			onError,
			plugins,
		}
	},
})
</script>

<template>
	<main>
		<BloxComponent :view="view" :variables="variables" @on:error="onError" :plugins="plugins"/>
	</main>
</template>
