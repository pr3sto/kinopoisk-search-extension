<script lang="ts">
  import type { MovieItem, PersonItem } from '../types/suggestions';
  import { BookmarkButton } from './BookmarkButton';

  interface Props {
    item: MovieItem | PersonItem;
  }

  let { item }: Props = $props();

  function handleLinkClick(event: MouseEvent) {
    // prevent click when text is selected
    if (document.getSelection()?.type === 'Range') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  function getRatingTag(): string {
    if (item.__typename !== 'MovieItem') {
      return 'none';
    } else if (item.rating && item.rating >= 7) {
      return 'positive';
    } else if (item.rating && item.rating < 5) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
</script>

<div class="suggestion-item">
  <a
    class={item.__typename === 'MovieItem' && item.viewOption
      ? `item__link item__link-viewoption item__link-viewoption--${item.viewOption}`
      : 'item__link'}
    href={item.url}
    target="_blank"
    draggable="false"
    data-navigation-item
    onclick={handleLinkClick}>
    {#if item.imgUrl}
      <img class="item__link__image" src={item.imgUrl} alt={item.name} />
    {:else}<span class="item__link__image image-placeholder"></span>{/if}
    <p class="item__link__text">
      <span class="item__link__text__name" title={item.name}>{item.name}</span>
      <span class="item__link__text__subname" title={item.subname}>
        {#if item.__typename === 'MovieItem'}
          <span
            class="item__link__text__rating item__link__text__rating--{getRatingTag()}">
            {item.rating?.toFixed(1) ?? String.fromCharCode(8212)}
          </span>
        {/if}
        {item.subname}
      </span>
    </p>
  </a>

  <BookmarkButton bookmarkTitle={item.name} bookmarkUrl={item.url} />
</div>

<style lang="scss">
  @use '../styles/colors.scss' as *;
  @use '../styles/dimensions.scss' as *;

  .suggestion-item {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    padding: $spacing-vertical-sm $spacing-horizontal-lg;
    transition: background 0.1s ease-out;

    &:has(.item__link:focus-within),
    &:hover {
      background: $background-color-light;
    }
  }

  .item__link {
    flex: 1;
    display: flex;
    padding-right: $spacing-horizontal-lg;
    white-space: nowrap;
    overflow: hidden;
    text-decoration: none;
    outline: none;
  }

  .item__link-viewoption {
    &--basic-kinopoisk {
      background: url("data:image/svg+xml,%3csvg opacity='0.7' width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='%23fff' d='M0 0h20v20H0z'/%3e%3cpath fill='url(%23a)' d='M0 0h20v20H0z'/%3e%3cpath fill='url(%23b)' d='M0 0h20v20H0z'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='m10.52 13.9 1.268-3.9H16.5a6.5 6.5 0 1 1-4.492-6.183l-1.48 4.558H6.202L5.673 10H10l-1.268 3.9h1.788Zm1.795-5.525 1.24-3.815a6.507 6.507 0 0 1 2.74 3.815h-3.98Z' fill='%23fff'/%3e%3cdefs%3e%3clinearGradient id='a' x1='0' y1='10' x2='20' y2='10' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='%23FF5C4D'/%3e%3cstop offset='.266' stop-color='%23EB469F'/%3e%3cstop offset='.75' stop-color='%238341EF'/%3e%3cstop offset='1' stop-color='%233F68F9'/%3e%3c/linearGradient%3e%3clinearGradient id='b' x1='0' y1='8.667' x2='20' y2='8.667' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='%23FF5C4D'/%3e%3cstop offset='.4' stop-color='%23EB469F'/%3e%3cstop offset='1' stop-color='%238341EF'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e")
        right no-repeat;
    }
    &--kp-amediateka {
      background: url("data:image/svg+xml,%3csvg opacity='0.7' width='40' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cg clip-path='url(%23a)'%3e%3cpath d='M20 0H0v20h20V0z' fill='url(%23b)'/%3e%3cmask id='c' style='mask-type:luminance' maskUnits='userSpaceOnUse' x='3' y='3' width='14' height='14'%3e%3cpath d='M16.5 10a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0z' fill='%23fff'/%3e%3c/mask%3e%3cg mask='url(%23c)'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M16.5 3.5h-13v13h13V10h-4.712l-1.268 3.9H8.733L10 10H5.673l.529-1.625h4.326L12.113 3.5H13.9l-1.584 4.875H16.5V3.5z' fill='%23fff'/%3e%3c/g%3e%3cpath d='M40 0H20v20h20V0z' fill='%23222'/%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M28.605 13.86h5.237l.816 1.578h2.553L31.237 3.504l-5.974 11.934h2.54l.802-1.579zm4.198-2.053h-3.171l1.579-3.171 1.592 3.17zm-3.277-7.5-5.565 11.131h.513L29.776 4.82l-.25-.513zm-1.684.802-5.158 10.33h.514l4.907-9.803-.263-.527z' fill='%23fff'/%3e%3c/g%3e%3cdefs%3e%3clinearGradient id='b' x1='0' y1='8.667' x2='20' y2='8.667' gradientUnits='userSpaceOnUse'%3e%3cstop stop-color='%23FF5C4D'/%3e%3cstop offset='.4' stop-color='%23EB469F'/%3e%3cstop offset='1' stop-color='%238341EF'/%3e%3c/linearGradient%3e%3cclipPath id='a'%3e%3cpath fill='%23fff' d='M0 0h40v20H0z'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e")
        right no-repeat;
    }
    &--kp-start {
      background: url("data:image/svg+xml,%3Csvg opacity='0.7' width='40' height='20' viewBox='0 0 80 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath transform='translate(0 .007)' fill='url(%23a)' d='M0 0h40v40H0z'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M20 7.007c-7.18 0-13 5.82-13 13s5.82 13 13 13 13-5.82 13-13h-9.425l-2.535 7.8h-3.575l2.535-7.8h-8.653l1.057-3.25h8.652L24.02 7.64A12.99 12.99 0 0 0 20 7.007Zm7.113 2.116-2.482 7.634h7.96a13.021 13.021 0 0 0-5.479-7.634Z' fill='%23fff'/%3E%3Cpath fill='%231F1F1F' d='M40 .007h40v40H40z'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M60 7c-7.18 0-13 5.82-13 13s5.82 13 13 13 13-5.82 13-13S67.18 7 60 7Zm3.8 11.782c.734.016 1.377.067 1.933.152 2.078.321 2.953 1.145 2.953 2.597v.174c0 1.204-.479 2.431-2.953 2.899-.668.126-1.48.197-2.468.197h-.858c-.956 0-1.745-.081-2.396-.22v.22h-.497c-3.573 0-4.816-1.134-5.224-2.219v1.984c-2.598-.58-2.953-2.103-2.953-3.074v-.137h5.791c.037.547.361 1.467 2.748 1.467h.076v-1.467h.068c.037.547.361 1.467 2.748 1.467h.174c2.437 0 2.71-.485 2.71-.982 0-.535-.285-.882-2.424-.932l-1.592-.038a11.483 11.483 0 0 1-1.624-.15v.18l-1.269-.029c-2.994-.085-4.187-.973-4.453-2.148v1.988c-2.127-.381-2.829-1.375-2.829-2.55v-.112c0-1.093.524-2.225 2.83-2.649v2.05c.251-1.168 1.38-2.223 4.975-2.223h.746v.162a12.551 12.551 0 0 1 2.147-.162h.858c1.11 0 2.003.098 2.717.268 2.1.5 2.654 1.615 2.654 2.654v.124H65.38c-.05-.36-.261-1.107-2.673-1.107h-.2c-2.238 0-2.4.41-2.4.796 0 .385.237.772 2.14.796l1.554.024Zm-4.448-.024.6.01v-1.6c-.046-.002-.091-.002-.14-.002h-.198c-2.239 0-2.4.41-2.4.796 0 .385.236.772 2.138.796Z' fill='%23fff'/%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='17.333' x2='40' y2='17.333' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF5C4D'/%3E%3Cstop offset='.4' stop-color='%23EB469F'/%3E%3Cstop offset='1' stop-color='%238341EF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")
        right no-repeat;
    }
    &--basic-kinopoisk,
    &--kp-amediateka,
    &--kp-start {
      background-clip: content-box;
      background-origin: content-box;
    }
  }

  .item__link__image {
    margin-right: $spacing-horizontal-lg;
    width: $image-width;
    height: $image-height;

    &.image-placeholder {
      display: block;
      background-image: url("data:image/svg+xml,%3Csvg width='601' height='900' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23EEE' d='M.992 0h600v900h-600z'/%3E%3Cpath d='M412.103 470.357v-40.715l-144.811 9.635 144.811-59.673v-40.715l-161.161 87.645 85.085-87.645h-50.05l-55.389 79.875v-79.875h-40.707v222.222h40.707v-79.876l55.389 79.876h50.05l-81.748-84.227 157.824 84.227v-40.715l-145.145-59.984 145.145 9.945Z' fill='%23d9d9d9'/%3E%3C/svg%3E%0A");
      background-size: cover;
    }
  }

  .item__link__text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: $image-height;
    user-select: text;
    overflow: hidden;

    &__name,
    &__subname {
      align-self: flex-start;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: auto;
    }
    &__name {
      color: $font-color-dark;
      font-size: $font-size-primary;
      font-weight: 600;
    }

    &__subname {
      color: $font-color-light;
      font-size: $font-size-small;
    }
  }

  .item__link__text__rating {
    font-size: $font-size-secondary;
    &--positive {
      color: $rating-color-positive;
      font-weight: 600;
    }
    &--negative {
      color: $rating-color-negative;
      font-weight: 600;
    }
    &--neutral {
      color: $rating-color-neutral;
      font-weight: 600;
    }
  }
</style>
