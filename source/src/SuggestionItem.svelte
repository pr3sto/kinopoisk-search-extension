<script>
  import BookmarkButton from "./BookmarkButton.svelte";
  export let item = {};

  function handleClickLink(event) {
    // prevent click when text is selected
    var selection = document.getSelection();
      if (selection.type === "Range") {
        event.preventDefault();
        return false;
      }
  }
</script>

<style>
  a {
    display: flex;
    padding: 5px 15px;
    justify-content: space-between;
    align-items: center;
    text-decoration: none;
    outline: none;
  }

  a:hover,
  a:focus {
    background: #f2f2f2;
  }

  .content-online,
  .content {
    display: flex;
    position: relative;
    flex: 1;
    white-space: nowrap;
    max-width: 350px;
  }

  .content-online:before {
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    content: "";
    opacity: 0.3;
    background: url("data:image/svg+xml,%3Csvg width='21' height='19' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Ctitle%3Ebackground%3C/title%3E%3Crect fill='none' id='canvas_background' height='10.21916' width='7.65067' y='-1' x='-1'/%3E%3C/g%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath id='svg_1' fill-rule='evenodd' fill='%23000000' d='m12.873,0.54c0.816,0.007 1.61,0.093 2.37,0.272c1.213,0.286 2.28,0.786 3.165,1.486a6.537,6.537 0 0 1 2.099,2.838c0.432,1.13 0.55,2.345 0.355,3.617c-0.174,1.172 -0.6,2.337 -1.276,3.46c-1.003,1.68 -2.481,3.145 -4.266,4.26c-0.544,0.343 -1.122,0.657 -1.722,0.922l-0.014,0.007a0.207,0.207 0 0 1 -0.056,0.029a13.68,13.68 0 0 1 -3.353,1.015c-0.028,0.007 -0.062,0.007 -0.09,0.014l2.614,-13.503l2.76,0l-1.819,9.329c0.063,-0.036 0.119,-0.065 0.174,-0.1c1.457,-0.88 2.642,-2.052 3.416,-3.403c0.893,-1.558 1.102,-3.152 0.593,-4.489c-0.51,-1.33 -1.701,-2.302 -3.353,-2.73a7.747,7.747 0 0 0 -1.646,-0.23c-0.648,0 -1.317,0.072 -1.993,0.215l0.564,-2.916c0.502,-0.064 0.99,-0.093 1.478,-0.093zm-6.963,1.787l-1.182,5.99l2.462,0l0.657,-3.367l2.761,0l-2.635,13.49l-2.76,0.014l1.536,-7.878l-2.467,0l-0.834,4.224l-2.747,0l0.829,-4.225l-1.483,0l0,-2.257l1.926,0l1.175,-5.99l2.76,0l0.002,-0.001z'/%3E%3C/g%3E%3C/svg%3E")
      right no-repeat;
  }

  .content__image {
    width: 24px;
    height: 36px;
    border-radius: 2px;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .content__image > img,
  span {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    object-fit: cover;
  }

  .content__image__placeholder {
    display: block;
    background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg version='1.1' viewBox='0 0 100 150' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3Cpattern id='a' width='100%25' height='100%25'%3E%3Cuse transform='scale(.5)' xlink:href='%23b'/%3E%3C/pattern%3E%3Cimage id='b' width='200' height='300' xlink:href='data:image/png;base64,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'/%3E%3C/defs%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg transform='translate(-16 -132)' fill='url(%23a)'%3E%3Crect x='16' y='132' width='100' height='150'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
    background-size: cover;
  }

  .content__text {
    overflow: hidden;
    cursor: auto;
    user-select: text;
  }

  .content__text__name {
    color: #333;
    font-size: 15px;
    font-weight: 500;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content__text__subname {
    color: #aaa;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rating {
    padding: 0 10px 0 10px;
    color: #777;
    font-size: 13px;
    font-weight: 600;
    text-align: right;
  }

  .rating--positive {
    color: #093;
  }

  .rating--negative {
    color: #ff0b0b;
  }

  .rating--neutral {
    color: #777;
  }
</style>

<a
  id={item.id}
  href={item.url}
  target="_blank"
  draggable="false"
  on:click={(e) => handleClickLink(e)}
>
  <div class={item.avaliableOnline ? 'content-online' : 'content'}>
    <div class="content__image">
      {#if item.imgUrl}
        <img src={item.imgUrl} alt={item.name} />
      {:else}<span class="content__image__placeholder" />{/if}
    </div>
    <div class="content__text">
      <div class="content__text__name">{item.name}</div>
      <div class="content__text__subname">{item.subname}</div>
    </div>
  </div>

  {#if item.showRating}
    {#if item.rating && item.rating < 5}
      <div class="rating rating--negative">{item.rating}</div>
    {:else if item.rating && item.rating >= 7}
      <div class="rating rating--positive">{item.rating}</div>
    {:else}
      <div class="rating rating--neutral">
        {item.rating ? item.rating : String.fromCharCode(8212)}
      </div>
    {/if}
  {/if}

  <BookmarkButton bookmarkTitle={item.name} bookmarkUrl={item.url} />
</a>
