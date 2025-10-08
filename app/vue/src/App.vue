<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  EmployeeManagement as EmployeeManagementCore,
  type EmployeeManagementProps,
} from "@senramii/employee-management-core";

import "@senramii/employee-management-core/style/base";
import "@senramii/employee-management-core/style/components";

interface Props extends EmployeeManagementProps {}

const props = defineProps<Props>();
const containerRef = ref<HTMLDivElement>();

let instance: EmployeeManagementCore | null = null;

onMounted(() => {
  instance = new EmployeeManagementCore(props);
  instance.mount(containerRef.value!);
});

onUnmounted(() => {
  instance?.destroy();
  instance = null;
});
</script>

<template>
  <div ref="containerRef"></div>
</template>

