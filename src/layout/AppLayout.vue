<template>
  <div class="layout-container">
    <div class="page-main">
      <el-scrollbar>
        <div style="display: flex">
          <div class="page-slot">
            adsad
          </div>
          <div />
        </div>
      </el-scrollbar>
    </div>
    <div class="page-form">
      <el-scrollbar>
        <div class="page-form-container">
          <div class="form-header">
            <div v-if="$slots.title || title" class="form-title">
              <slot name="title">{{ title }}</slot>
            </div>
            <div v-if="$slots.description || description" class="form-description">
              <slot name="description">{{ description }}</slot>
            </div>
          </div>

          <div class="form-main">
            <slot />
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AppLayout',
  };
</script>

<style lang="scss" scoped>
  .layout-container {
    display: flex;
    overflow: hidden;

    .page-main {
      height: 100%;
      overflow: auto;
      flex-grow: 1;
      position: relative;

      .page-slot {
        flex-grow: 1;
        padding: 20px;
      }
    }

    .page-form {
      height: 100%;
      flex-shrink: 0;
      border-left: 1px solid var(--border-color);
    }
  }
</style>
