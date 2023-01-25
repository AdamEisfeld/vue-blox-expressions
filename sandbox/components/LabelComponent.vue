<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
	name: 'LabelComponent',
	components: undefined,
	props: {
		text: {
			type: [String, Number, Boolean] as PropType<string | number | boolean>,
		}
	},
	emits: undefined,
	setup(props, { emit }) {
		return {}
	},
})

</script>
	
<template>
	<span>{{ text }}</span>
</template>
