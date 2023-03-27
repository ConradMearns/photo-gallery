<script>
  import { onMount } from "svelte";
  
  let domain = "";
  let port = 3001;
  $: url = `${domain}:${port}`;

  let all_images = [];

  async function fetchImages() {
    const response = await fetch(`http://${url}/images`);
    if (response.ok) {
      all_images = await response.json();
    }
  }

  function updateImage(event, image) {
    event.target.src = `http://${url}${image.imageUrl}?height=200`;
  }

  onMount(() => {
    domain = window.location.hostname
    url = `${domain}:${port}`;

    fetchImages()
  });
</script>

<ul>
  {#each all_images as image}
    <li>
      <a href={`http://${url}${image.imageUrl}`}>
        <div style="height: 200px;">
          <img
            src={`http://${url}${image.imageUrl}?height=30&quality=1&cache=false`}
            alt={image.path}
            height="200"
            loading="lazy"
            on:load={(event) => {
              updateImage(event, image);
            }}
          />
        </div>
      </a>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin: 0;
  }

  a {
    display: block;
  }
</style>
