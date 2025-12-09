<script lang="ts">
    import DataTable from "./data-table.svelte";
    import { columns } from "./columns";
    import { seedDatabase } from "$lib/seed";
    import { Button } from "$lib/components/ui/button";
    import { invalidateAll } from "$app/navigation";

    let { data } = $props();
</script>

<div class="container mx-auto py-10 space-y-4">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Games Backlog</h1>

        <Button 
            variant="destructive" 
            onclick={async () => {
                if(confirm('Delete DB and generate test data?')) {
                    await seedDatabase();
                    await invalidateAll(); 
                }
            }}
        >
            Reset & Seed Data
        </Button>
    </div>

    <DataTable data={data.entries} {columns} />
</div>
