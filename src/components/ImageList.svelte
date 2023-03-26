<script>
  // import { Image } from "svelte-lazy-loader";
  import { onMount } from "svelte";

  let all_images = [];

  async function fetchImages() {
    const response = await fetch("http://localhost:8080/images");
    if (response.ok) {
      all_images = await response.json();
    }
  }

  onMount(fetchImages);
</script>

<ul>
  {#each all_images as image}
    <li>
      <a href={`http://localhost:8080${image.imageUrl}`}>
        <img
          src={`http://localhost:8080${image.imageUrl}?height=200`}
          alt={image.path}
          height="200"
        />
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
      /* flex-basis: calc(33.33% - 1rem); */
      /* margin: 0.5rem; */
      margin: 0;
    }
  
    a {
      display: block;
    }
  
    img {
      width: 100%;
      height: auto;
    }
  </style>