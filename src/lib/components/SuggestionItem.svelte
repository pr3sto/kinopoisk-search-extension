<script lang="ts">
  import type { MovieItem, PersonItem } from '../types/suggestions';
  import BookmarkButton from './BookmarkButton.svelte';

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

<a
  href={item.url}
  target="_blank"
  draggable="false"
  data-navigation-item
  onclick={handleLinkClick}>
  <div
    class={item.__typename === 'MovieItem' && item.viewOption
      ? `content content-viewoption content-viewoption--${item.viewOption}`
      : 'content'}>
    <div class="content__image">
      {#if item.imgUrl}
        <img src={item.imgUrl} alt={item.name} />
      {:else}<span class="content__image__placeholder"></span>{/if}
    </div>
    <div class="content__text">
      <div class="content__text__name">
        <span title={item.name}>{item.name}</span>
      </div>
      <div class="content__text__subname">
        <span title={item.subname}>
          {#if item.__typename === 'MovieItem'}
            <span
              class="content__text__rating content__text__rating--{getRatingTag()}">
              {item.rating?.toFixed(1) ?? String.fromCharCode(8212)}
            </span>
          {/if}
          {item.subname}
        </span>
      </div>
    </div>
  </div>

  <BookmarkButton bookmarkTitle={item.name} bookmarkUrl={item.url} />
</a>

<style lang="scss">
  @use '../styles/colors.scss' as *;
  @use '../styles/dimensions.scss' as *;

  a {
    display: flex;
    padding: $spacing-vertical-sm $spacing-horizontal-lg;
    justify-content: space-between;
    align-items: stretch;
    text-decoration: none;
    outline: none;
    transition: background 0.1s ease-out;

    &:hover,
    &:focus-within {
      background: $background-color-light;
    }
  }

  .content {
    display: flex;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    margin-right: $spacing-horizontal-lg;
  }

  .content-viewoption {
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
  }

  .content__image {
    flex-shrink: 0;
    margin-right: $spacing-horizontal-lg;
    width: $image-width;
    height: $image-height;

    & > img,
    span {
      width: 100%;
      height: 100%;
    }
  }

  .content__image__placeholder {
    display: block;
    background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg version='1.1' viewBox='0 0 100 150' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3Cpattern id='a' width='100%25' height='100%25'%3E%3Cuse transform='scale(.5)' xlink:href='%23b'/%3E%3C/pattern%3E%3Cimage id='b' width='200' height='300' xlink:href='data:image/png;base64,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'/%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg transform='translate(-16 -132)' fill='url(%23a)'%3E%3Crect x='16' y='132' width='100' height='150'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
    background-size: cover;
  }

  .content__text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: $image-height;
    user-select: text;
    overflow: hidden;
  }

  .content__text__name {
    color: $font-color-dark;
    font-size: $font-size-primary;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;

    & span {
      cursor: auto;
    }
  }

  .content__text__subname {
    color: $font-color-light;
    font-size: $font-size-small;
    overflow: hidden;
    text-overflow: ellipsis;

    & span {
      cursor: auto;
    }
  }

  .content__text__rating {
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
