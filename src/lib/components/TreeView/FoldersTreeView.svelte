<script lang="ts">
  import type { BookmarkFolder } from '../../types/bookmark-folder';
  import Self from './FoldersTreeView.svelte';

  interface Props {
    isRoot: boolean;
    folders: BookmarkFolder[];
    folderClickCallback(folder: BookmarkFolder): void;
  }

  let { isRoot, folders, folderClickCallback }: Props = $props();

  function handleFolderButtonClick(event: MouseEvent, folder: BookmarkFolder) {
    event.stopPropagation();
    event.preventDefault();
    folderClickCallback(folder);
  }
</script>

<div class={isRoot ? 'treeview-root' : 'treeview'}>
  {#each folders as folder}
    <div class="treeview__folder">
      <button
        class="treeview__folder__button"
        data-navigation-item
        onclick={(e) => handleFolderButtonClick(e, folder)}>
        <div class="treeview__folder__button__text">
          <span class="folder-icon"></span>
          <span title={folder.title}>{folder.title}</span>
        </div>
      </button>
      {#if folder.children.length !== 0}
        <Self isRoot={false} folders={folder.children} {folderClickCallback} />
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  @use '../../styles/colors.scss' as *;
  @use '../../styles/dimensions.scss' as *;

  $tree-indication: 1px solid $background-color-dark;

  .treeview {
    margin-left: $spacing-horizontal-sm;

    & .treeview__folder {
      position: relative;

      &:not(:last-child) {
        border-left: $tree-indication;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: $spacing-horizontal-sm;
          height: calc($spacing-vertical-sm + $font-size-primary/2);
          border-bottom: $tree-indication;
        }
      }

      &:last-child {
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: $spacing-horizontal-sm;
          height: calc($spacing-vertical-sm + $font-size-primary/2);
          border-left: $tree-indication;
          border-bottom: $tree-indication;
        }
      }
    }
  }

  .treeview__folder__button {
    display: flex;
    width: 100%;
    padding: $spacing-vertical-sm $spacing-horizontal-sm;
    border: none;
    outline: none;
    text-align: start;
    background: $background-color-base;
    transition: background 0.1s ease-out;
    cursor: pointer;

    &:hover,
    &:focus-within {
      background: $background-color-light;
    }
  }

  .treeview__folder__button__text {
    font-size: $font-size-primary;
    line-height: $font-size-primary;
    color: $font-color-dark;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .folder-icon {
    display: inline-block;
    vertical-align: bottom;
    margin-right: 2px;
    width: $icon-width-regular;
    height: 1em;
    background: $font-color-light;
    mask: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 445.96 445.96' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect x='-1' y='-1' width='802' height='602' fill='none'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m336.06 173.98h-141.67l-10.324-70.317c-2.397-16.325-17.858-29.682-34.358-29.682h-123.75c-16.5 0-28.039 13.357-25.642 29.682l39.392 268.32h367.5l-35.047-168.63c-3.358-16.155-19.605-29.372-36.105-29.372z'/%3E%3Cpath d='m420.35 103.98h-205.92l5.872 39.999h115.75c14.855 0 29.74 5.454 41.913 15.357s20.541 23.367 23.564 37.911l19.05 91.658 25.002-155.31c2.623-16.29-8.731-29.619-25.231-29.619z'/%3E%3C/g%3E%3C/svg%3E%0A")
      center no-repeat;
  }
</style>
