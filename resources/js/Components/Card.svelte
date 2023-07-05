<script>
    export let productImageUrl;
    export let productName;
    export let productDescription;
    export let primaryButtonText;
</script>

<div class="card lg:card-side bg-base-100 shadow-xl">
    <figure><img src="{productImageUrl}" alt="{productName}"/></figure>
    <div class="card-body">
      <h2 class="card-title">{productName}</h2>
      <p>{productDescription}</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary">{primaryButtonText}</button>
      </div>
    </div>
  </div>
